import { NextRequest, NextResponse } from 'next/server'
import * as unifiedAPI from '@/lib/services/unified-disney-api'
import { PARK_IDS } from '@/types/themeparks'

/**
 * GET /api/unified/wait-times
 *
 * Get real-time wait times across all Walt Disney World parks
 *
 * Query parameters:
 * - parkId: Filter by specific park (slug or UUID)
 * - minWaitTime: Minimum wait time to include (minutes)
 * - maxWaitTime: Maximum wait time to include (minutes)
 * - status: Filter by attraction status (operating, closed, refurbishment, down)
 * - sortBy: Sort results (waitTime, name, park) - default: waitTime
 * - sortOrder: Sort order (asc, desc) - default: desc
 * - includeCharacters: Include associated characters (default: false)
 * - includePredictions: Include wait time predictions (default: false)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const parkIdFilter = searchParams.get('parkId')
        const minWaitTime = searchParams.get('minWaitTime') ? parseInt(searchParams.get('minWaitTime')!) : undefined
        const maxWaitTime = searchParams.get('maxWaitTime') ? parseInt(searchParams.get('maxWaitTime')!) : undefined
        const statusFilter = searchParams.get('status')
        const sortBy = searchParams.get('sortBy') || 'waitTime'
        const sortOrder = searchParams.get('sortOrder') || 'desc'
        const includeCharacters = searchParams.get('includeCharacters') === 'true'
        const includePredictions = searchParams.get('includePredictions') === 'true'

        // Get wait times for all parks
        const allWaitTimes = await unifiedAPI.getAllParksWaitTimes()

        // Flatten wait times with park information
        let flattenedWaitTimes = allWaitTimes.parks.flatMap(park =>
            park.waitTimes.map(wt => ({
                ...wt,
                parkId: park.parkId,
                parkName: park.parkName
            }))
        )

        // Apply filters
        if (parkIdFilter) {
            // Support both slug and UUID
            const parkIdMap: Record<string, string> = {
                'magic-kingdom': PARK_IDS.MAGIC_KINGDOM,
                'epcot': PARK_IDS.EPCOT,
                'hollywood-studios': PARK_IDS.HOLLYWOOD_STUDIOS,
                'animal-kingdom': PARK_IDS.ANIMAL_KINGDOM
            }
            const actualParkId = parkIdMap[parkIdFilter.toLowerCase()] || parkIdFilter
            flattenedWaitTimes = flattenedWaitTimes.filter(wt => wt.parkId === actualParkId)
        }

        if (statusFilter) {
            flattenedWaitTimes = flattenedWaitTimes.filter(wt =>
                wt.status.toLowerCase() === statusFilter.toLowerCase()
            )
        }

        if (minWaitTime !== undefined) {
            flattenedWaitTimes = flattenedWaitTimes.filter(wt =>
                wt.waitTime !== null && wt.waitTime >= minWaitTime
            )
        }

        if (maxWaitTime !== undefined) {
            flattenedWaitTimes = flattenedWaitTimes.filter(wt =>
                wt.waitTime !== null && wt.waitTime <= maxWaitTime
            )
        }

        // Sort results
        flattenedWaitTimes.sort((a, b) => {
            let comparison = 0

            switch (sortBy) {
                case 'waitTime':
                    const aTime = a.waitTime ?? -1
                    const bTime = b.waitTime ?? -1
                    comparison = aTime - bTime
                    break
                case 'name':
                    comparison = a.name.localeCompare(b.name)
                    break
                case 'park':
                    comparison = a.parkName.localeCompare(b.parkName)
                    break
            }

            return sortOrder === 'desc' ? -comparison : comparison
        })

        // Add predictions if requested (mock data for now)
        if (includePredictions) {
            flattenedWaitTimes = flattenedWaitTimes.map(wt => ({
                ...wt,
                predictedWaitTime: wt.waitTime ? Math.max(5, wt.waitTime + Math.floor(Math.random() * 20 - 10)) : null,
                trend: wt.waitTime && wt.waitTime > 30 ? 'INCREASING' : 'STABLE'
            }))
        }

        // Calculate statistics
        const operatingAttractions = flattenedWaitTimes.filter(wt =>
            wt.status === 'OPERATING' && wt.waitTime !== null
        )
        const waitTimesArray = operatingAttractions.map(wt => wt.waitTime!).filter(wt => wt > 0)

        const statistics = {
            totalAttractions: flattenedWaitTimes.length,
            operatingAttractions: operatingAttractions.length,
            averageWaitTime: waitTimesArray.length > 0
                ? Math.round(waitTimesArray.reduce((a, b) => a + b, 0) / waitTimesArray.length)
                : 0,
            maxWaitTime: waitTimesArray.length > 0 ? Math.max(...waitTimesArray) : 0,
            minWaitTime: waitTimesArray.length > 0 ? Math.min(...waitTimesArray) : 0,
            attractionsUnder30Min: waitTimesArray.filter(wt => wt < 30).length,
            attractionsOver60Min: waitTimesArray.filter(wt => wt > 60).length,
            parkBreakdown: allWaitTimes.parks.map(park => ({
                parkId: park.parkId,
                parkName: park.parkName,
                averageWaitTime: park.averageWaitTime,
                totalAttractions: park.waitTimes.length,
                operatingAttractions: park.waitTimes.filter(wt => wt.status === 'OPERATING').length
            }))
        }

        // Top wait times
        const topWaitTimes = [...flattenedWaitTimes]
            .filter(wt => wt.waitTime !== null && wt.status === 'OPERATING')
            .sort((a, b) => b.waitTime! - a.waitTime!)
            .slice(0, 10)

        return NextResponse.json({
            success: true,
            data: {
                waitTimes: flattenedWaitTimes,
                statistics,
                topWaitTimes,
                lastUpdate: allWaitTimes.lastUpdate,
                filters: {
                    parkId: parkIdFilter,
                    minWaitTime,
                    maxWaitTime,
                    status: statusFilter,
                    sortBy,
                    sortOrder
                }
            }
        })

    } catch (error) {
        console.error('Error fetching unified wait times:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch wait times',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}