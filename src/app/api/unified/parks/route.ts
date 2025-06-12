import { NextRequest, NextResponse } from 'next/server'
import * as unifiedAPI from '@/lib/services/unified-disney-api'
import * as themeParksAPI from '@/lib/services/themeparks-api'
import { PARK_IDS } from '@/types/themeparks'

/**
 * GET /api/unified/parks
 *
 * Get unified park data across all Walt Disney World parks
 *
 * Query parameters:
 * - includeWaitTimes: Include current wait times (default: true)
 * - includeCharacters: Include associated characters (default: false)
 * - includeSchedule: Include today's schedule (default: true)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const includeWaitTimes = searchParams.get('includeWaitTimes') !== 'false'
        const includeCharacters = searchParams.get('includeCharacters') === 'true'
        const includeSchedule = searchParams.get('includeSchedule') !== 'false'

        const parks = [
            { id: PARK_IDS.MAGIC_KINGDOM, slug: 'magic-kingdom', name: 'Magic Kingdom' },
            { id: PARK_IDS.EPCOT, slug: 'epcot', name: 'EPCOT' },
            { id: PARK_IDS.HOLLYWOOD_STUDIOS, slug: 'hollywood-studios', name: 'Hollywood Studios' },
            { id: PARK_IDS.ANIMAL_KINGDOM, slug: 'animal-kingdom', name: 'Animal Kingdom' }
        ]

        // Fetch all park data in parallel
        const parkDataPromises = parks.map(async ({ id, slug, name }) => {
            try {
                if (includeCharacters) {
                    // Get full unified data with characters
                    const unifiedData = await unifiedAPI.getUnifiedParkData(id)
                    return {
                        ...unifiedData,
                        slug,
                        displayName: name
                    }
                } else {
                    // Get basic park data without characters for performance
                    const [parkData, liveData, scheduleData] = await Promise.allSettled([
                        themeParksAPI.getEntity(id),
                        includeWaitTimes ? themeParksAPI.getLiveData(id) : Promise.resolve(null),
                        includeSchedule ? themeParksAPI.getSchedule(id) : Promise.resolve(null)
                    ])

                    const park = parkData.status === 'fulfilled' ? parkData.value : null
                    if (!park) throw new Error(`Failed to fetch data for ${name}`)

                    // Process wait times
                    let waitTimesSummary = null
                    if (includeWaitTimes && liveData.status === 'fulfilled' && liveData.value) {
                        const attractions = liveData.value.liveData.filter(
                            item => item.entityType === 'ATTRACTION' && item.status === 'OPERATING'
                        )
                        const waitTimes = attractions
                            .map(a => a.queue?.STANDBY?.waitTime)
                            .filter((wt): wt is number => wt !== null && wt !== undefined)

                        waitTimesSummary = {
                            averageWaitTime: waitTimes.length > 0
                                ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
                                : 0,
                            maxWaitTime: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
                            totalAttractions: attractions.length,
                            operatingAttractions: waitTimes.length
                        }
                    }

                    // Get today's hours
                    let todaySchedule = null
                    if (includeSchedule && scheduleData.status === 'fulfilled' && scheduleData.value) {
                        const today = new Date().toISOString().split('T')[0]
                        todaySchedule = scheduleData.value.schedule.find(s => s.date === today)
                    }

                    return {
                        ...park,
                        slug,
                        displayName: name,
                        waitTimesSummary,
                        todaySchedule,
                        crowdLevel: waitTimesSummary
                            ? calculateCrowdLevel(waitTimesSummary.averageWaitTime)
                            : null
                    }
                }
            } catch (error) {
                console.error(`Error fetching data for ${name}:`, error)
                return {
                    id,
                    slug,
                    name,
                    displayName: name,
                    error: error instanceof Error ? error.message : 'Failed to fetch park data'
                }
            }
        })

        const parksData = await Promise.all(parkDataPromises)

        // Calculate resort-wide statistics
        const validParks = parksData.filter(p => !('error' in p))
        const totalStats = {
            totalParks: parks.length,
            parksOpen: validParks.length,
            resortAverageWaitTime: 0,
            resortCrowdLevel: 0,
            lastUpdate: new Date().toISOString()
        }

        if (includeWaitTimes && validParks.length > 0) {
            const parkAverages = validParks
                .map(p => (p as any).waitTimesSummary?.averageWaitTime || 0)
                .filter((avg: number) => avg > 0)

            if (parkAverages.length > 0) {
                totalStats.resortAverageWaitTime = Math.round(
                    parkAverages.reduce((a, b) => a + b, 0) / parkAverages.length
                )
                totalStats.resortCrowdLevel = calculateCrowdLevel(totalStats.resortAverageWaitTime)
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                parks: parksData,
                resortStats: totalStats
            }
        })

    } catch (error) {
        console.error('Error in unified parks endpoint:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch unified park data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// Helper function to calculate crowd level from average wait time
function calculateCrowdLevel(averageWaitTime: number): number {
    if (averageWaitTime < 15) return 1
    if (averageWaitTime < 25) return 3
    if (averageWaitTime < 35) return 5
    if (averageWaitTime < 50) return 7
    if (averageWaitTime < 70) return 9
    return 10
}
