import { NextRequest, NextResponse } from 'next/server'
import * as unifiedAPI from '@/lib/services/unified-disney-api'
import { PARK_IDS } from '@/types/themeparks'

interface RouteParams {
    params: Promise<{
        parkId: string
    }>
}

// Map slugs to park IDs
const PARK_ID_MAP: Record<string, string> = {
    'magic-kingdom': PARK_IDS.MAGIC_KINGDOM,
    'epcot': PARK_IDS.EPCOT,
    'hollywood-studios': PARK_IDS.HOLLYWOOD_STUDIOS,
    'animal-kingdom': PARK_IDS.ANIMAL_KINGDOM,
    // Also support direct IDs
    [PARK_IDS.MAGIC_KINGDOM]: PARK_IDS.MAGIC_KINGDOM,
    [PARK_IDS.EPCOT]: PARK_IDS.EPCOT,
    [PARK_IDS.HOLLYWOOD_STUDIOS]: PARK_IDS.HOLLYWOOD_STUDIOS,
    [PARK_IDS.ANIMAL_KINGDOM]: PARK_IDS.ANIMAL_KINGDOM
}

const PARK_NAMES: Record<string, string> = {
    [PARK_IDS.MAGIC_KINGDOM]: 'Magic Kingdom',
    [PARK_IDS.EPCOT]: 'EPCOT',
    [PARK_IDS.HOLLYWOOD_STUDIOS]: 'Hollywood Studios',
    [PARK_IDS.ANIMAL_KINGDOM]: 'Animal Kingdom'
}

/**
 * GET /api/unified/parks/[parkId]
 *
 * Get comprehensive unified data for a specific park
 *
 * Path parameters:
 * - parkId: Park slug (e.g., 'magic-kingdom') or UUID
 *
 * Query parameters:
 * - includeCharacters: Include associated Disney characters (default: true)
 * - includeWaitTimes: Include current wait times (default: true)
 * - includeSchedule: Include park schedule (default: true)
 * - includeRecommendations: Include attraction recommendations (default: false)
 * - maxWaitTime: Maximum wait time for recommendations (minutes)
 * - characterPreferences: Comma-separated character names for recommendations
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { parkId } = await params
        const searchParams = request.nextUrl.searchParams

        // Get actual park ID from slug or direct ID
        const actualParkId = PARK_ID_MAP[parkId.toLowerCase()]
        if (!actualParkId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid park ID',
                    message: `Park '${parkId}' not found`,
                    validParks: Object.keys(PARK_ID_MAP).filter(k => !k.includes('-'))
                },
                { status: 404 }
            )
        }

        const includeCharacters = searchParams.get('includeCharacters') !== 'false'
        const includeWaitTimes = searchParams.get('includeWaitTimes') !== 'false'
        const includeSchedule = searchParams.get('includeSchedule') !== 'false'
        const includeRecommendations = searchParams.get('includeRecommendations') === 'true'

        // Get comprehensive unified park data
        const parkData = await unifiedAPI.getUnifiedParkData(actualParkId)

        // Enhanced response object
        const response: any = {
            success: true,
            data: {
                ...parkData,
                displayName: PARK_NAMES[actualParkId]
            }
        }

        // Remove data based on query parameters
        if (!includeCharacters) {
            delete response.data.associatedCharacters
        }
        if (!includeWaitTimes) {
            delete response.data.currentWaitTimes
        }
        if (!includeSchedule) {
            delete response.data.todaySchedule
        }

        // Add recommendations if requested
        if (includeRecommendations) {
            const maxWaitTime = searchParams.get('maxWaitTime')
            const characterPreferences = searchParams.get('characterPreferences')

            const preferences: any = {}
            if (maxWaitTime) {
                preferences.maxWaitTime = parseInt(maxWaitTime)
            }
            if (characterPreferences) {
                preferences.characterPreferences = characterPreferences.split(',').map(c => c.trim())
            }

            const recommendations = await unifiedAPI.getRecommendedAttractions(
                actualParkId,
                preferences
            )

            response.data.recommendations = {
                attractions: recommendations,
                preferences,
                generatedAt: new Date().toISOString()
            }
        }

        // Add additional metadata
        response.metadata = {
            dataFreshness: {
                park: 'static',
                waitTimes: includeWaitTimes ? 'real-time' : null,
                schedule: includeSchedule ? 'daily' : null,
                characters: includeCharacters ? 'cached' : null
            },
            lastUpdate: new Date().toISOString(),
            sources: [
                'themeparks.wiki',
                includeCharacters ? 'disneyapi.dev' : null
            ].filter(Boolean)
        }

        return NextResponse.json(response)

    } catch (error) {
        const { parkId } = await params
        console.error(`Error fetching unified data for park ${parkId}:`, error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch unified park data',
                message: error instanceof Error ? error.message : 'Unknown error',
                parkId
            },
            { status: 500 }
        )
    }
}