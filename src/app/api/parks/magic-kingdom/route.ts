import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withEdge } from '../../config'
import { validateQuery } from '@/lib/api/validation'
import { errorResponse, successResponse } from '@/lib/api/response'
import * as themeParksAPI from '@/lib/services/themeparks-api'

// Define schema for query validation
const MagicKingdomQuerySchema = z.object({
    type: z.enum(['details', 'live', 'attractions', 'schedule']).optional().default('details'),
    year: z.string().regex(/^\d{4}$/).optional(),
    month: z.string().regex(/^\d{1,2}$/).optional()
})

export const runtime = 'edge'

/**
 * GET /api/parks/magic-kingdom
 *
 * Get Magic Kingdom specific data
 *
 * Query parameters:
 * - type: 'details' | 'live' | 'attractions' | 'schedule'
 * - year: YYYY (for schedule)
 * - month: MM (for schedule)
 */
async function handleGet(request: NextRequest) {
    try {
        // Validate query parameters
        const validation = await validateQuery(request, MagicKingdomQuerySchema)
        if (!validation.success) {
            return validation.error!
        }

        const { type, year, month } = validation.data

        switch (type) {
            case 'details': {
                const parkData = await themeParksAPI.getMagicKingdom()
                return successResponse(parkData)
            }

            case 'live': {
                const liveData = await themeParksAPI.getMagicKingdomLive()
                return successResponse(liveData)
            }

            case 'attractions': {
                const attractionsData = await themeParksAPI.getMagicKingdomAttractions()
                return successResponse(attractionsData)
            }

            case 'schedule': {
                const scheduleData = await themeParksAPI.getMagicKingdomSchedule(
                    year ? parseInt(year) : undefined,
                    month ? parseInt(month) : undefined
                )
                return successResponse(scheduleData)
            }

            default: {
                return errorResponse(
                    'Invalid type parameter',
                    'INVALID_TYPE',
                    400
                )
            }
        }
    } catch (error) {
        console.error('Error fetching Magic Kingdom data:', error)
        return errorResponse(
            'Failed to fetch Magic Kingdom data',
            'API_ERROR',
            500
        )
    }
}

// Use the edge function wrapper with caching enabled
export const GET = withEdge(handleGet, {
    cacheTtl: 60, // 1 minute for live data
    edgeCaching: true
})