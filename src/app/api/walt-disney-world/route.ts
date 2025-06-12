import { NextRequest, NextResponse } from 'next/server'
import * as themeParksAPI from '@/lib/services/themeparks-api'
import * as unifiedAPI from '@/lib/services/unified-disney-api'
import { PARK_IDS } from '@/types/themeparks'

/**
 * GET /api/walt-disney-world
 *
 * Get comprehensive Walt Disney World Resort information
 *
 * Query parameters:
 * - includeParks: Include all park information (default: true)
 * - includeWaitTimes: Include current wait times (default: true)
 * - includeSchedules: Include park schedules (default: true)
 * - includeHotels: Include resort hotels (default: false)
 * - includeCharacters: Include Disney characters (default: false)
 * - includeStatistics: Include resort-wide statistics (default: true)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const includeParks = searchParams.get('includeParks') !== 'false'
        const includeWaitTimes = searchParams.get('includeWaitTimes') !== 'false'
        const includeSchedules = searchParams.get('includeSchedules') !== 'false'
        const includeHotels = searchParams.get('includeHotels') === 'true'
        const includeCharacters = searchParams.get('includeCharacters') === 'true'
        const includeStatistics = searchParams.get('includeStatistics') !== 'false'

        // Get base resort information
        const resortData = await themeParksAPI.getEntity(PARK_IDS.WALT_DISNEY_WORLD_RESORT)

        // Build response
        const response: any = {
            success: true,
            data: {
                resort: {
                    id: resortData.id,
                    name: resortData.name,
                    slug: resortData.slug,
                    location: resortData.location,
                    timezone: resortData.timezone,
                    entityType: resortData.entityType
                }
            }
        }

        // Get park data if requested
        if (includeParks) {
            const parkIds = [
                { id: PARK_IDS.MAGIC_KINGDOM, name: 'Magic Kingdom', slug: 'magic-kingdom' },
                { id: PARK_IDS.EPCOT, name: 'EPCOT', slug: 'epcot' },
                { id: PARK_IDS.HOLLYWOOD_STUDIOS, name: 'Hollywood Studios', slug: 'hollywood-studios' },
                { id: PARK_IDS.ANIMAL_KINGDOM, name: 'Animal Kingdom', slug: 'animal-kingdom' }
            ]

            const parkPromises = parkIds.map(async ({ id, name, slug }) => {
                try {
                    const [parkData, liveData, scheduleData] = await Promise.allSettled([
                        themeParksAPI.getEntity(id),
                        includeWaitTimes ? themeParksAPI.getLiveData(id) : Promise.resolve(null),
                        includeSchedules ? themeParksAPI.getSchedule(id) : Promise.resolve(null)
                    ])

                    const park = parkData.status === 'fulfilled' ? parkData.value : null
                    if (!park) return null

                    const result: any = {
                        ...park,
                        displayName: name,
                        slug
                    }

                    // Add wait times summary
                    if (includeWaitTimes && liveData.status === 'fulfilled' && liveData.value) {
                        const operatingAttractions = liveData.value.liveData.filter(
                            item => item.entityType === 'ATTRACTION' &&
                                   item.status === 'OPERATING' &&
                                   item.queue?.STANDBY?.waitTime
                        )
                        const waitTimes = operatingAttractions
                            .map(a => a.queue?.STANDBY?.waitTime!)
                            .filter(wt => wt > 0)

                        result.currentStatus = {
                            operatingAttractions: operatingAttractions.length,
                            averageWaitTime: waitTimes.length > 0
                                ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
                                : 0,
                            maxWaitTime: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
                            lastUpdate: liveData.value.lastUpdate
                        }
                    }

                    // Add today's schedule
                    if (includeSchedules && scheduleData.status === 'fulfilled' && scheduleData.value) {
                        const today = new Date().toISOString().split('T')[0]
                        const todaySchedule = scheduleData.value.schedule.find(s => s.date === today)
                        if (todaySchedule) {
                            result.todaySchedule = todaySchedule
                        }
                    }

                    return result
                } catch (error) {
                    console.error(`Error fetching data for ${name}:`, error)
                    return null
                }
            })

            const parks = (await Promise.all(parkPromises)).filter(p => p !== null)
            response.data.parks = parks
        }

        // Get resort hotels if requested
        if (includeHotels) {
            try {
                const resortChildren = await themeParksAPI.getChildren(PARK_IDS.WALT_DISNEY_WORLD_RESORT)
                const hotels = resortChildren.children.filter(
                    child => child.entityType === 'HOTEL'
                )
                response.data.hotels = {
                    count: hotels.length,
                    list: hotels.map(hotel => ({
                        id: hotel.id,
                        name: hotel.name,
                        slug: hotel.slug,
                        location: hotel.location
                    }))
                }
            } catch (error) {
                console.error('Error fetching hotels:', error)
                response.data.hotels = { error: 'Failed to fetch hotels' }
            }
        }

        // Get resort-wide statistics if requested
        if (includeStatistics && includeParks && includeWaitTimes) {
            const allWaitTimes = await unifiedAPI.getAllParksWaitTimes()

            const operatingStats = allWaitTimes.parks.reduce((acc, park) => {
                const operating = park.waitTimes.filter(wt => wt.status === 'OPERATING')
                acc.totalAttractions += park.waitTimes.length
                acc.operatingAttractions += operating.length
                acc.waitTimes.push(...operating.map(wt => wt.waitTime).filter((wt): wt is number => wt !== null))
                return acc
            }, {
                totalAttractions: 0,
                operatingAttractions: 0,
                waitTimes: [] as number[]
            })

            response.data.statistics = {
                resort: {
                    totalParks: 4,
                    totalAttractions: operatingStats.totalAttractions,
                    operatingAttractions: operatingStats.operatingAttractions,
                    averageWaitTime: operatingStats.waitTimes.length > 0
                        ? Math.round(operatingStats.waitTimes.reduce((a, b) => a + b, 0) / operatingStats.waitTimes.length)
                        : 0,
                    crowdLevel: unifiedAPI.calculateCrowdLevel(
                        operatingStats.waitTimes.length > 0
                            ? operatingStats.waitTimes.reduce((a, b) => a + b, 0) / operatingStats.waitTimes.length
                            : 0
                    )
                },
                byPark: allWaitTimes.parks.map(park => ({
                    parkName: park.parkName,
                    averageWaitTime: park.averageWaitTime,
                    totalAttractions: park.waitTimes.length,
                    operatingAttractions: park.waitTimes.filter(wt => wt.status === 'OPERATING').length
                })),
                topWaitTimes: allWaitTimes.parks
                    .flatMap(park => park.waitTimes)
                    .filter(wt => wt.status === 'OPERATING' && wt.waitTime !== null)
                    .sort((a, b) => b.waitTime! - a.waitTime!)
                    .slice(0, 10)
                    .map(wt => ({
                        attraction: wt.name,
                        waitTime: wt.waitTime,
                        park: allWaitTimes.parks.find(p =>
                            p.waitTimes.some(pwt => pwt.id === wt.id)
                        )?.parkName
                    }))
            }
        }

        // Add metadata
        response.metadata = {
            generated: new Date().toISOString(),
            sources: ['themeparks.wiki'],
            dataTypes: {
                parks: includeParks,
                waitTimes: includeWaitTimes,
                schedules: includeSchedules,
                hotels: includeHotels,
                characters: includeCharacters,
                statistics: includeStatistics
            }
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('Error fetching Walt Disney World data:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch Walt Disney World data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// Helper function (temporary duplicate - should be imported from unified service)
function calculateCrowdLevel(averageWaitTime: number): number {
    if (averageWaitTime < 15) return 1
    if (averageWaitTime < 25) return 3
    if (averageWaitTime < 35) return 5
    if (averageWaitTime < 50) return 7
    if (averageWaitTime < 70) return 9
    return 10
}