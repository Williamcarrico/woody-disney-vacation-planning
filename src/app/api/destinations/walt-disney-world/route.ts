import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withEdge } from '../../config'
import { validateQuery } from '@/lib/api/validation'
import { errorResponse, successResponse } from '@/lib/api/response'
import * as themeParksAPI from '@/lib/services/themeparks-api'
import { PARK_IDS } from '@/types/themeparks'

// Define schema for query validation
const WaltDisneyWorldQuerySchema = z.object({
    type: z.enum(['details', 'children', 'live']).optional().default('details')
})

export const runtime = 'edge'

/**
 * GET /api/destinations/walt-disney-world
 *
 * Get Walt Disney World Resort data
 *
 * Query parameters:
 * - type: 'details' | 'children' | 'live'
 */
async function handleGet(request: NextRequest): Promise<NextResponse> {
    try {
        // Validate query parameters
        const validation = await validateQuery(request, WaltDisneyWorldQuerySchema)
        if (!validation.success) {
            return validation.error as NextResponse
        }

        const { type } = validation.data

        switch (type) {
            case 'details': {
                const wdwData = await themeParksAPI.getEntity(PARK_IDS.WALT_DISNEY_WORLD_RESORT)
                return successResponse(wdwData)
            }

            case 'children': {
                const childrenData = await themeParksAPI.getWaltDisneyWorldChildren()

                // Group children by entity type for better organization
                const grouped = childrenData.children.reduce((acc, child) => {
                    const type = child.entityType || 'OTHER'
                    if (!acc[type]) acc[type] = []
                    acc[type].push(child)
                    return acc
                }, {} as Record<string, typeof childrenData.children>)

                return successResponse({
                    ...childrenData,
                    grouped,
                    summary: {
                        total: childrenData.children.length,
                        parks: grouped['PARK']?.length || 0,
                        attractions: grouped['ATTRACTION']?.length || 0,
                        restaurants: grouped['RESTAURANT']?.length || 0,
                        shows: grouped['SHOW']?.length || 0,
                        hotels: grouped['HOTEL']?.length || 0
                    }
                })
            }

            case 'live': {
                const liveData = await themeParksAPI.getWaltDisneyWorldLive()
                return successResponse(liveData)
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
        console.error('Error fetching Walt Disney World data:', error)
        return errorResponse(
            'Failed to fetch Walt Disney World data',
            'API_ERROR',
            500
        )
    }
}

// Use the edge function wrapper with caching enabled
export const GET = withEdge(handleGet, {
    cacheTtl: 300, // 5 minutes
    edgeCaching: true
})