import { NextRequest, NextResponse } from 'next/server'
import {
    getAnimalKingdom,
    getAnimalKingdomLive,
    getAnimalKingdomAttractions,
    getAnimalKingdomSchedule,
    getEntity,
    getLiveData,
    getChildren,
    getSchedule
} from '@/lib/services/themeparks-api'
import type { LiveDataItem, EntityType } from '@/types/themeparks'

// Animal Kingdom specific entity IDs
const ANIMAL_KINGDOM_ID = '1c84a229-8862-4648-9c71-378ddd2c7693'
const WALT_DISNEY_WORLD_ID = 'e957da41-3552-4cf6-b636-5babc5cbc4e5'

// Animal Kingdom lands mapping
const LANDS_MAPPING: Record<string, string[]> = {
    'Discovery Island': ['tree-of-life', 'discovery-island'],
    'Pandora - The World of Avatar': ['pandora', 'avatar'],
    'Africa': ['africa', 'harambe'],
    'Asia': ['asia', 'anandapur'],
    'DinoLand U.S.A.': ['dinoland', 'dino-land'],
    "Rafiki's Planet Watch": ['rafiki', 'planet-watch', 'conservation-station']
}

// Helper function to determine land from entity name or tags
function determineLand(entity: any): string {
    const nameLower = entity.name?.toLowerCase() || ''

    for (const [land, keywords] of Object.entries(LANDS_MAPPING)) {
        if (keywords.some(keyword => nameLower.includes(keyword))) {
            return land
        }
    }

    // Special cases
    if (nameLower.includes('everest')) return 'Asia'
    if (nameLower.includes('safari') || nameLower.includes('gorilla')) return 'Africa'
    if (nameLower.includes('dinosaur') || nameLower.includes('primeval')) return 'DinoLand U.S.A.'
    if (nameLower.includes('flight of passage') || nameLower.includes('navi')) return 'Pandora - The World of Avatar'

    return 'Discovery Island' // Default
}

// Helper function to categorize attraction type
function getAttractionType(entity: any): string {
    const nameLower = entity.name?.toLowerCase() || ''

    if (nameLower.includes('trail') || nameLower.includes('walk')) return 'trail'
    if (nameLower.includes('show') || nameLower.includes('theater') || nameLower.includes('musical')) return 'show'
    if (nameLower.includes('safari') || nameLower.includes('train')) return 'family'
    if (nameLower.includes('rapids') || nameLower.includes('everest') || nameLower.includes('dinosaur')) return 'thrill'
    if (nameLower.includes('playground') || nameLower.includes('kids')) return 'kids'

    return 'family' // Default
}

// Height requirements mapping
const HEIGHT_REQUIREMENTS: Record<string, string> = {
    'avatar flight of passage': '44" (112 cm)',
    'expedition everest': '44" (112 cm)',
    'dinosaur': '40" (102 cm)',
    'kali river rapids': '38" (97 cm)'
}

// Dining type categorization
function getDiningType(entity: any): 'table-service' | 'quick-service' | 'snack' {
    const nameLower = entity.name?.toLowerCase() || ''

    // Table service restaurants
    if (nameLower.includes('tusker house') ||
        nameLower.includes('tiffins') ||
        nameLower.includes('yak & yeti restaurant')) {
        return 'table-service'
    }

    // Snacks and carts
    if (nameLower.includes('cart') ||
        nameLower.includes('stand') ||
        nameLower.includes('popcorn') ||
        nameLower.includes('ice cream')) {
        return 'snack'
    }

    return 'quick-service' // Default
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const dataType = searchParams.get('type') || 'overview'

        switch (dataType) {
            case 'overview': {
                // Get park overview data
                const parkData = await getAnimalKingdom()
                const liveData = await getAnimalKingdomLive()
                const schedule = await getAnimalKingdomSchedule()

                // Calculate crowd level based on average wait times
                const operatingAttractions = liveData.liveData.filter(
                    item => item.status === 'OPERATING' && item.queue?.STANDBY?.waitTime
                )
                const avgWaitTime = operatingAttractions.length > 0
                    ? Math.round(
                        operatingAttractions.reduce((sum, item) =>
                            sum + (item.queue?.STANDBY?.waitTime || 0), 0
                        ) / operatingAttractions.length
                    )
                    : 0

                // Determine crowd level (1-10 scale)
                let crowdLevel = 1
                if (avgWaitTime > 60) crowdLevel = 8
                else if (avgWaitTime > 45) crowdLevel = 6
                else if (avgWaitTime > 30) crowdLevel = 4
                else if (avgWaitTime > 15) crowdLevel = 2

                return NextResponse.json({
                    park: parkData,
                    currentStatus: {
                        isOpen: liveData.liveData.some(item => item.status === 'OPERATING'),
                        crowdLevel,
                        averageWaitTime: avgWaitTime,
                        totalAttractions: liveData.liveData.filter(
                            item => item.entityType === EntityType.ATTRACTION
                        ).length,
                        operatingAttractions: operatingAttractions.length,
                        weather: {
                            temp: 82, // Would integrate with weather API
                            condition: 'Sunny'
                        }
                    },
                    todaySchedule: schedule.schedule[0],
                    lands: Object.keys(LANDS_MAPPING)
                })
            }

            case 'attractions': {
                // Get all attractions with live data
                const [attractions, liveData] = await Promise.all([
                    getAnimalKingdomAttractions(),
                    getAnimalKingdomLive()
                ])

                // Create a map of live data by ID
                const liveDataMap = new Map(
                    liveData.liveData.map(item => [item.id, item])
                )

                // Filter and enhance attraction data
                const enhancedAttractions = attractions.children
                    .filter(child => child.entityType === EntityType.ATTRACTION)
                    .map(attraction => {
                        const live = liveDataMap.get(attraction.id)
                        const nameLower = attraction.name.toLowerCase()

                        return {
                            id: attraction.id,
                            name: attraction.name,
                            slug: attraction.slug,
                            land: determineLand(attraction),
                            type: getAttractionType(attraction),
                            status: live?.status || 'CLOSED',
                            waitTime: live?.queue?.STANDBY?.waitTime || 0,
                            lightningLane: !!(live?.queue?.PAID_RETURN_TIME || live?.queue?.RETURN_TIME),
                            lightningLanePrice: live?.queue?.PAID_RETURN_TIME?.price,
                            height: HEIGHT_REQUIREMENTS[nameLower] || null,
                            location: attraction.location,
                            nextShowtime: live?.showtimes?.[0],
                            operatingHours: live?.operatingHours?.[0]
                        }
                    })
                    .sort((a, b) => b.waitTime - a.waitTime)

                return NextResponse.json({
                    attractions: enhancedAttractions,
                    lastUpdate: liveData.lastUpdate
                })
            }

            case 'dining': {
                // Get all dining locations
                const [children, liveData] = await Promise.all([
                    getAnimalKingdomAttractions(),
                    getAnimalKingdomLive()
                ])

                const liveDataMap = new Map(
                    liveData.liveData.map(item => [item.id, item])
                )

                const dining = children.children
                    .filter(child => child.entityType === EntityType.RESTAURANT)
                    .map(restaurant => {
                        const live = liveDataMap.get(restaurant.id)

                        return {
                            id: restaurant.id,
                            name: restaurant.name,
                            slug: restaurant.slug,
                            type: getDiningType(restaurant),
                            land: determineLand(restaurant),
                            status: live?.status || 'CLOSED',
                            location: restaurant.location,
                            operatingHours: live?.operatingHours
                        }
                    })

                return NextResponse.json({
                    dining,
                    lastUpdate: liveData.lastUpdate
                })
            }

            case 'entertainment': {
                // Get shows and entertainment
                const [children, liveData] = await Promise.all([
                    getAnimalKingdomAttractions(),
                    getAnimalKingdomLive()
                ])

                const liveDataMap = new Map(
                    liveData.liveData.map(item => [item.id, item])
                )

                const entertainment = children.children
                    .filter(child => child.entityType === EntityType.SHOW)
                    .map(show => {
                        const live = liveDataMap.get(show.id)

                        return {
                            id: show.id,
                            name: show.name,
                            slug: show.slug,
                            location: determineLand(show),
                            status: live?.status || 'CLOSED',
                            showtimes: live?.showtimes || [],
                            nextShowtime: live?.showtimes?.[0]
                        }
                    })

                return NextResponse.json({
                    entertainment,
                    lastUpdate: liveData.lastUpdate
                })
            }

            case 'schedule': {
                // Get park schedule
                const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined
                const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined

                const schedule = await getAnimalKingdomSchedule(year, month)

                return NextResponse.json(schedule)
            }

            case 'live': {
                // Get all live data
                const liveData = await getAnimalKingdomLive()
                return NextResponse.json(liveData)
            }

            case 'wdw-context': {
                // Get Walt Disney World context data
                const [wdwData, wdwChildren, wdwLive] = await Promise.all([
                    getEntity(WALT_DISNEY_WORLD_ID),
                    getChildren(WALT_DISNEY_WORLD_ID),
                    getLiveData(WALT_DISNEY_WORLD_ID)
                ])

                return NextResponse.json({
                    resort: wdwData,
                    parks: wdwChildren.children.filter(child => child.entityType === EntityType.PARK),
                    hotels: wdwChildren.children.filter(child => child.entityType === EntityType.HOTEL),
                    liveData: wdwLive
                })
            }

            case 'map': {
                // Get map-specific data (interactive park map)
                const [parkData, attractions, liveData] = await Promise.all([
                    getAnimalKingdom(),
                    getAnimalKingdomAttractions(),
                    getAnimalKingdomLive()
                ])

                const liveDataMap = new Map(
                    liveData.liveData.map(item => [item.id, item])
                )

                // Prepare map points with live data
                const mapPoints = attractions.children
                    .filter(child => child.location && (
                        child.entityType === EntityType.ATTRACTION ||
                        child.entityType === EntityType.RESTAURANT ||
                        child.entityType === EntityType.SHOW
                    ))
                    .map(entity => {
                        const live = liveDataMap.get(entity.id)

                        return {
                            id: entity.id,
                            name: entity.name,
                            type: entity.entityType,
                            land: determineLand(entity),
                            location: entity.location,
                            status: live?.status || 'CLOSED',
                            waitTime: live?.queue?.STANDBY?.waitTime,
                            nextShowtime: live?.showtimes?.[0]
                        }
                    })

                return NextResponse.json({
                    park: {
                        id: parkData.id,
                        name: parkData.name,
                        location: parkData.location,
                        lands: Object.keys(LANDS_MAPPING)
                    },
                    points: mapPoints,
                    lastUpdate: liveData.lastUpdate
                })
            }

            default:
                return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
        }
    } catch (error) {
        console.error('Error in Animal Kingdom API route:', error)
        return NextResponse.json(
            { error: 'Failed to fetch park data', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}